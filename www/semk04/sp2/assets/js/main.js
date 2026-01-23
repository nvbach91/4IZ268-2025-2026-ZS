// PERSONAL BOOK CATALOG

const App = {
    // ukládání jednotlivých knih
    data: [],
    // proměnná - zda upravujeme nějakou konkrétní knihu
    editingId: null,
    // Local storage
    storageKey: 'personal_book_catalog',
    // jaké knihy zrovna vidíme - default - all
    currentFilter: 'all',

    // Úkol č. 10: Proměnná pro uložení časovače debounce
    searchTimeout: null,

    // běží hned potom co se stránka načte - inicializace
    init() {
        this.cacheDom();
        // zprovozní funkčnost tlačítek
        this.bindEvents();
        // nahraje data z local storage
        this.loadData();
        // zobrazí data
        this.render();
    },

    // Úkol č. 9
    // cache => uložit si něco pro rychlí přístup
    cacheDom() {
        // container pro kartičky s knihami
        this.$container = $('#book-list-container');
        // formulář pro přidávání knih
        this.$form = $('#add-book-form');
        // elementy pro hledání a filtrování
        this.$searchInput = $('#search-input');
        this.$sortSelect = $('#sort-select');
        // všechna tlačítka
        this.$filterBtns = $('.filter-btn');
        // najde políčko pro zadávání ISBN
        this.$isbnInput = $('#isbn');
        // načítací prvek, když aplikace něco načítá z internetu
        this.$loadingIndicator = $('#loading-indicator');
        // najde tlačítko pro přidání knihy
        this.$btnAdd = $('.btn-add');

        // pole API kniha/autor
        this.$apiSearchInput = $('#api-search-query');
        // dynamicky se zobrazí výsledky z API - výběr konkrétní knihy
        this.$apiSearchResults = $('#api-search-results');
        
        // všechny pole formuláře u sebe - jedno jméno = jedno políčko
        this.formInputs = {
            title: $('#title'),
            author: $('#author'),
            genre: $('#genre'),
            status: $('#status'),
            note: $('#note'),
            isbn: $('#isbn'),
            cover: $('#cover-url')
        };
    },


    // naslouchá tomu, co uživatel dělá
    bindEvents() {
        // handleSubmit - zabrání obnovení stránky
        this.$form.on('submit', (e) => this.handleSubmit(e));

        // API Search - blur - opustí políčko - aplikace i tak stáhne data automaticky
        this.$isbnInput.on('blur', (e) => this.fetchBookData(e));
        $('#btn-search-isbn').on('click', () => this.$isbnInput.trigger('blur'));

        // aktivace tlačítka hledat - název/autor
        $('#btn-api-search').on('click', () => this.searchBooksByKeywords());
        // možnost vybrat si konkrétní knihu
        this.$apiSearchResults.on('click', '.api-result-item', (e) => this.selectApiBook(e));

        // přepínání filtrů - kategorie
        this.$filterBtns.on('click', (e) => this.handleFilter(e));
        
        // Úkol č. 10: Implementace Debounce na vyhledávání
        this.$searchInput.on('keyup', () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.render();
            }, 300); // Počká 300ms po dopsání, než překreslí seznam
        });
        
        // rozevírací seznam
        this.$sortSelect.on('change', () => this.render());

        // delete, edit, favorite, status
        this.$container.on('click', '.btn-delete', (e) => this.deleteBook(e));
        this.$container.on('click', '.btn-edit', (e) => this.editBook(e));
        this.$container.on('click', '.btn-favorite', (e) => this.toggleFavorite(e));
        this.$container.on('change', '.status-select-input', (e) => this.handleStatusChange(e));
        
        // Úkol č. 7: Kliknutí na kartu pro zobrazení detailu (modální okno)
        this.$container.on('click', '.clickable-area', (e) => this.showBookDetail(e));
        
        // mobilní zobrazení pro formulář a statistiky
        $('#form-toggle').on('click', function() {
            if ($(window).width() <= 768) {
                $('#add-book-form, .stats-container').slideToggle();
                $(this).toggleClass('active');
            }
        });
    },

    loadData() {
        // lokální data
        const stored = localStorage.getItem(this.storageKey);
        // zkontroluj zda již něco existuje
        if (stored) {
            try {
                // JSON.parse - převede textový řetězec back  na pole objektů
                this.data = JSON.parse(stored);
            } catch (e) {
                console.error("Error loading data:", e);
                // zajištění aby aplikace nezkolabovala
                this.data = [];
            }
        }
    },

    // úkládá data do local storage
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    },

    // Úkol č. 2: Vzhledávání na základě textu
    async searchBooksByKeywords() {
        // načtení textu
        const query = this.$apiSearchInput.val().trim();
        if (query.length < 3) {
            this.showNotification('Zadejte alespoň 3 znaky.', 'error');
            return;
        }

        // spinner
        this.toggleLoading(true);
        // výmaz předchozího hledání
        this.$apiSearchResults.empty().hide();

        try {
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
            
            if (response.data.totalItems > 0) {
                const items = response.data.items.map(item => {
                    // zkratka k objektu
                    const info = item.volumeInfo;
                    // údaje o knize
                    const title = info.title || 'Bez názvu';
                    const authors = info.authors ? info.authors.join(', ') : 'Neznámý autor';
                    const isbn = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : '';
                    const cover = info.imageLinks ? info.imageLinks.thumbnail : '';
                    const genre = info.categories ? info.categories[0] : '';

                    return `
                        <div class="api-result-item" 
                             data-title="${this.escapeHtml(title)}" 
                             data-author="${this.escapeHtml(authors)}"
                             data-isbn="${this.escapeHtml(isbn)}"
                             data-cover="${this.escapeHtml(cover)}"
                             data-genre="${this.escapeHtml(genre)}">
                            <strong>${this.escapeHtml(title)}</strong>
                            <small>${this.escapeHtml(authors)}</small>
                        </div>`;
                }).join('');

                // vloží vygenerované html do stránky a zobrazí
                this.$apiSearchResults.html(items).fadeIn();
            } else {
                this.showNotification('Žádné knihy nebyly nalezeny.', 'error');
            }
        } catch (error) {
            this.showNotification('Chyba při vyhledávání.', 'error');
        } finally {
            this.toggleLoading(false);
        }
    },

    // přenese data z vyhledávání do formuláře
    selectApiBook(e) {
        const $item = $(e.currentTarget);
        this.formInputs.title.val($item.data('title'));
        this.formInputs.author.val($item.data('author'));
        this.formInputs.isbn.val($item.data('isbn'));
        this.formInputs.cover.val($item.data('cover'));
        this.formInputs.genre.val($item.data('genre'));

        // uzamknutí pro název, autora a ISBN
        this.toggleInputsReadonly(true);

        this.$apiSearchResults.fadeOut();
        this.$apiSearchInput.val('');
        this.showNotification('Data byla vložena do formuláře.', 'success');
    },

    // async - nechceme aby stránka po dobu načítání zamrznula
    async fetchBookData(e) {
        // získáme hodnotu ISBN
        const isbn = $(e.target).val().trim();
        if (isbn.length < 10) return;

        this.toggleLoading(true);

        try {
            // axios pošle dotaz na server Google Books API
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            
            if (response.data.totalItems > 0) {
                // výtahne informace o první nalezené knize
                const bookInfo = response.data.items[0].volumeInfo;
                
                // Automatické vyplnění formuláře
                this.formInputs.title.val(bookInfo.title);
                this.formInputs.author.val(bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown');
                this.formInputs.genre.val(bookInfo.categories ? bookInfo.categories[0] : '');
                
                if (bookInfo.imageLinks && bookInfo.imageLinks.thumbnail) {
                    this.formInputs.cover.val(bookInfo.imageLinks.thumbnail);
                }
                
                this.showNotification('Data successfully loaded.', 'success');
            } else {
                this.showNotification('Book with this ISBN not found.', 'error');
            }
        } catch (error) {
            console.error(error);
            this.showNotification('Server communication error.', 'error');
        } finally {
            this.toggleLoading(false);
        }
    },

    // točící se kolečko - ovládání
    toggleLoading(show) {
        if (show) this.$loadingIndicator.show();
        else this.$loadingIndicator.hide();      
    },

    // zpracování formuláře
    handleSubmit(e) {
        e.preventDefault();
 
        const titleVal = this.formInputs.title.val().trim();
        const authorVal = this.formInputs.author.val().trim();
        const isbnVal = this.formInputs.isbn.val().trim();

        if (!titleVal) {
            this.showNotification('Název knihy je povinný.', 'error');
            return;
        }

        if (this.editingId) {
            // edit button
            const index = this.data.findIndex(b => b.id === this.editingId);
            if (index !== -1) {
                const originalBook = this.data[index];
                
                // Úkol č. 6: Pokud je kniha z API, vynutíme původní hodnoty
                const updatedBook = {
                    ...originalBook,
                    title: originalBook.isFromApi ? originalBook.title : titleVal,
                    author: originalBook.isFromApi ? originalBook.author : authorVal,
                    isbn: originalBook.isFromApi ? originalBook.isbn : isbnVal,
                    genre: this.formInputs.genre.val().trim(),
                    status: this.formInputs.status.val(),
                    note: this.formInputs.note.val().trim(),
                    cover: this.formInputs.cover.val().trim() || originalBook.cover
                };

                this.data[index] = updatedBook;
                this.showNotification('Kniha aktualizována.', 'success');
            }
            this.editingId = null;
            this.$btnAdd.text('PŘIDAT KNIHU').removeClass('btn-save-mode');

        } else {
            // --- PŘIDÁVÁNÍ NOVÉ KNIHY ---
            
            // Úkol č. 1: Kontrola duplicit
            const isDuplicate = this.data.some(book => {
                if (isbnVal && book.isbn === isbnVal) return true;
                return book.title.toLowerCase() === titleVal.toLowerCase() && 
                       book.author.toLowerCase() === authorVal.toLowerCase();
            });

            if (isDuplicate) {
                this.showNotification('Tato kniha již v katalogu existuje!', 'error');
                return; 
            }

            // nová kniha
            this.data.push({
                // unikátní id pomocí aktuálního času
                id: Date.now(),
                isFavorite: false,
                dateAdded: new Date(),
                // Pokud je pole pro název readonly, znamená to, že data přišla z API
                isFromApi: this.formInputs.title.prop('readonly'), 
                title: titleVal,
                author: authorVal,
                isbn: isbnVal,
                genre: this.formInputs.genre.val().trim(),
                status: this.formInputs.status.val(),
                note: this.formInputs.note.val().trim(),
                cover: this.formInputs.cover.val().trim() || 'https://via.placeholder.com/120x160?text=No+Cover'
            });
            this.showNotification('Kniha byla úspěšně přidána.', 'success');
        }

        this.saveData();                    // uložení dat
        this.render();                      // překreslí seznam
        this.$form[0].reset();              // vymaže políčka ve formuláři
        this.toggleInputsReadonly(false);   // odemkne pole pro další knihu
    },

    // přepínání mezi režimem úprav a pouze pro čtení
    toggleInputsReadonly(isApi) {
        const fieldsToLock = [this.formInputs.title, this.formInputs.author, this.formInputs.isbn];
        fieldsToLock.forEach($field => {
            $field.prop('readonly', isApi);
            // Volitelně přidáme třídu pro vizuální odlišení (např. zešednutí)
            if (isApi) $field.addClass('readonly-input');
            else $field.removeClass('readonly-input');
        });
    },

    // úkol 4 - okamžitá reakce na stav knihy
    handleStatusChange(e) {
        const $select = $(e.target);
        const id = $select.closest('.book-card').data('id');
        const newStatus = $select.val();
        
        const book = this.data.find(b => b.id === id);
        if (book) {
            book.status = newStatus;
            this.saveData();
            this.render(); // Překreslíme, aby se aktualizovaly statistiky a filtry
            this.showNotification('Stav knihy byl aktualizován.', 'success');
        }
    },

    // Vymaže knihu
    // Úkol č. 8: Odstranění z DOM bez překreslení celého seznamu
    async deleteBook(e) {
        const $card = $(e.target).closest('.book-card');
        const id = $card.data('id');
        const book = this.data.find(b => b.id === id);

        const result = await Swal.fire({
            title: 'Opravdu smazat?',
            text: `Kniha: ${book.title}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ano, smazat!',
            cancelButtonText: 'Zrušit'
        });

        if (result.isConfirmed) {
            // 1. Odstranit z datového pole
            this.data = this.data.filter(b => b.id !== id);
            this.saveData();
            
            // 2. Odstranit přímo z HTML bez volání render()
            $card.fadeOut(400, () => {
                $card.remove();
                // Poté jen aktualizujeme počty v filtrech
                this.updateFilterCounts();
            });

            this.showNotification('Kniha smazána.', 'success');
        }
    },

    // Edit book details
    editBook(e) {
        const id = $(e.target).closest('.book-card').data('id');
        const book = this.data.find(b => b.id === id);
        if (!book) return;

        // Naplní formulář
        this.formInputs.title.val(book.title);
        this.formInputs.author.val(book.author);
        this.formInputs.genre.val(book.genre);
        this.formInputs.status.val(book.status);
        this.formInputs.note.val(book.note);
        this.formInputs.isbn.val(book.isbn);
        this.formInputs.cover.val(book.cover);

        this.editingId = id;
        // hlavní tlačítko se změní na save changes
        this.$btnAdd.text('SAVE CHANGES').addClass('btn-save-mode');
        
        this.toggleInputsReadonly(!!book.isFromApi);

        // Plynule se stránka vyroluje nahoru
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    },

    // Úkol č. 7: Modální okno s detaily
    showBookDetail(e) {
        const id = $(e.currentTarget).closest('.book-card').data('id');
        const book = this.data.find(b => b.id === id);
        if (!book) return;

        Swal.fire({
            title: book.title,
            html: `
                <div style="text-align: left;">
                    <p><strong>Autor:</strong> ${this.escapeHtml(book.author)}</p>
                    <p><strong>ISBN:</strong> ${this.escapeHtml(book.isbn) || 'Neuvedeno'}</p>
                    <p><strong>Žánr:</strong> ${this.escapeHtml(book.genre) || 'Neuvedeno'}</p>
                    <p><strong>Poznámka:</strong> ${this.escapeHtml(book.note) || '<em>Bez poznámky</em>'}</p>
                    <p><small>V katalogu od: ${new Date(book.dateAdded).toLocaleDateString()}</small></p>
                </div>
            `,
            imageUrl: book.cover,
            custonClass: {
                image: 'custom-swal-image'
            },
            confirmButtonText: 'Zavřít'
        });
    },

    // oblíbené - funguje jako on/off
    toggleFavorite(e) {
        const id = $(e.target).closest('.book-card').data('id');
        const book = this.data.find(b => b.id === id);
        if (book) {
            book.isFavorite = !book.isFavorite;
            this.saveData();
            this.render();
        }
    },

    // Přepinání mezi kategoriemi
    handleFilter(e) {
        this.$filterBtns.removeClass('active');
        const btn = $(e.target);
        btn.addClass('active');
        this.currentFilter = btn.data('filter');
        this.render();
    },

    // aktualizace číselných )dajů - bez nutnosti vykreslovat celý seznam znovu
    updateFilterCounts() {
        const counts = {
            all: this.data.length,
            read: this.data.filter(b => b.status === 'read').length,
            'not read': this.data.filter(b => b.status === 'not read').length,
            reading: this.data.filter(b => b.status === 'reading').length,
            favorites: this.data.filter(b => b.isFavorite).length
        };

        this.$filterBtns.each((index, btn) => {
            const $btn = $(btn);
            const type = $btn.data('filter');
            const baseText = $btn.text().split(' (')[0];
            $btn.text(`${baseText} (${counts[type] || 0})`);
        });

        // statistiky
        $('#stat-total').text(counts.all);
        $('#stat-read').text(counts.read);
        $('#stat-not-read').text(counts['not read']);
        $('#stat-reading').text(counts.reading);
    },

    render() {
        // to co uživatel napsal převede na malá písmena
        const query = this.$searchInput.val().toLowerCase();
        // podle čeho chceme seznam řadit    
        const sortBy = this.$sortSelect.val();

        // vytvoří kopii seznamu - která splňuje zvolené podmínky
        let filtered = this.data.filter(book => {
            if (this.currentFilter === 'favorites' && !book.isFavorite) return false;
            if (this.currentFilter !== 'all' && this.currentFilter !== 'favorites' && book.status !== this.currentFilter) return false;
            
            const textMatch = book.title.toLowerCase().includes(query) || 
                              book.author.toLowerCase().includes(query);
            return textMatch;
        });

        // řazení knih
        filtered.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return new Date(b.dateAdded) - new Date(a.dateAdded); 
        });

        // Úkol č. 3: Výpočet počtů pro filtry
        const counts = {
            all: this.data.length,
            read: this.data.filter(b => b.status === 'read').length,
            'not read': this.data.filter(b => b.status === 'not read').length,
            reading: this.data.filter(b => b.status === 'reading').length,
            favorites: this.data.filter(b => b.isFavorite).length
        };

        // Aktualizace textů na tlačítkách filtrů
        this.$filterBtns.each((index, btn) => {
            const $btn = $(btn);
            const filterType = $btn.data('filter');
            const count = counts[filterType] || 0;
            
            // Původní text tlačítka (Vše, Přečteno, atd.)
            let baseText = "";
            switch(filterType) {
                case 'all': baseText = "Vše"; break;
                case 'read': baseText = "Přečteno"; break;
                case 'not read': baseText = "Nepřečteno"; break;
                case 'reading': baseText = "Rozečteno"; break;
                case 'favorites': baseText = "Oblíbené"; break;
            }
            
            $btn.text(`${baseText} (${count})`);
        });

        // statistiky - počítáno ze všech knih
        $('#stat-total').text(this.data.length);
        $('#stat-read').text(this.data.filter(b => b.status === 'read').length);
        $('#stat-not-read').text(this.data.filter(b => b.status === 'not read').length);
        $('#stat-reading').text(this.data.filter(b => b.status === 'reading').length);

        
        // generování HTML
        if (filtered.length === 0) {
                this.$container.html('<p class="no-books-message">No books found.</p>');
                return;
            }

            const htmlContent = filtered.map(book => {
                const favText = book.isFavorite ? '★ Favorited' : '☆ Favorite';
                const favClass = book.isFavorite ? 'is-fav' : '';
            
            return `
            <div class="book-card" data-id="${book.id}">
                <div class="clickable-area">
                    <img src="${this.escapeHtml(book.cover)}" alt="Cover" class="book-cover">
                    <div class="book-details">
                        <h3>${this.escapeHtml(book.title)}</h3>
                        <p class="book-meta"><strong>Autor:</strong> ${this.escapeHtml(book.author)}</p>
                        <p class="book-meta"><strong>Žánr:</strong> ${this.escapeHtml(book.genre) || 'Neuvedeno'}</p>
                    </div>
                </div>

                <div class="card-footer">
                    <div class="card-actions">
                        <div class="status-selector">
                            <label><small>Stav:</small></label>
                            <select class="status-select-input">
                                <option value="not read" ${book.status === 'not read' ? 'selected' : ''}>Nepřečteno</option>
                                <option value="reading" ${book.status === 'reading' ? 'selected' : ''}>Rozečteno</option>
                                <option value="read" ${book.status === 'read' ? 'selected' : ''}>Přečteno</option>
                            </select>
                        </div>
                        <div class="button-group">
                            <button class="btn-favorite ${favClass}">${favText}</button>
                            <button class="btn-delete">Smazat</button>
                            <button class="btn-edit">Upravit</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        this.$container.html(htmlContent);
    },

    // notifikace - zobrazí se v levím horním rohu
    showNotification(message, type = 'info') {
        // Definice Toastu (malé vyskakovací okno v rohu)
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: type === 'error' ? 'error' : (type === 'success' ? 'success' : 'info'),
            title: message
        });
    },

    // XSS ochrana
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

// uvadíme aplikaci do provozu
$(document).ready(() => {
    App.init();
});