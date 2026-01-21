// PERSONAL BOOK CATALOG

const App = {
    // Stores book entries
    data: [],
    // Tracks whether a specific book is being edited or not
    editingId: null,
    // Local storage
    storageKey: 'personal_book_catalog',
    // Current display filter - default: everything
    currentFilter: 'all',

    // Runs immediately after the page is loaded
    init() {
        this.cacheDom();
        // Attaches event listeners to make buttons functional
        this.bindEvents();
        // Loads data from local storage
        this.loadData();
        // Initial data rendering
        this.render();
    },

    cacheDom() {
        // Container for book cards
        this.$container = $('#book-list-container');
        // Form for adding new books
        this.$form = $('#add-book-form');
        // Elements for search and sorting
        this.$searchInput = $('#search-input');
        this.$sortSelect = $('#sort-select');
        // Selects elements by class
        this.$filterBtns = $('.filter-btn');
        this.$isbnInput = $('#isbn');
        // Loading indicator for background processes
        this.$loadingIndicator = $('#loading-indicator');
        this.$btnAdd = $('.btn-add');
        
        // Form input fields
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


    bindEvents() {
        // Form submission
        this.$form.on('submit', (e) => this.handleSubmit(e));

        // API Search - fetching ISBN data from the internet
        this.$isbnInput.on('blur', (e) => this.fetchBookData(e));
        $('#btn-search-isbn').on('click', () => this.$isbnInput.trigger('blur'));

        // Filtering buttons and inputs
        this.$filterBtns.on('click', (e) => this.handleFilter(e));
        this.$searchInput.on('keyup', () => this.render());
        this.$sortSelect.on('change', () => this.render());

        // Delegate events for book actions (Delete, Edit, Favorite, Status)
        this.$container.on('click', '.btn-delete', (e) => this.deleteBook(e));
        this.$container.on('click', '.btn-edit', (e) => this.editBook(e));
        this.$container.on('click', '.btn-favorite', (e) => this.toggleFavorite(e));
        this.$container.on('click', '.status-badge', (e) => this.toggleStatus(e));
        
        // Mobile navigation toggle
        $('#form-toggle').on('click', function() {
            if ($(window).width() <= 768) {
                $('#add-book-form, .stats-container').slideToggle();
                $(this).toggleClass('active');
            }
        });
    },

    loadData() {
        // Load data from local storage
        const stored = localStorage.getItem(this.storageKey);
        // Check if data exists
        if (stored) {
            try {
                this.data = JSON.parse(stored);
            } catch (e) {
                console.error("Error loading data:", e);
                // Fallback to prevent app crash
                this.data = [];
            }
        }
    },

    // Save data to local storage
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    },

    async fetchBookData(e) {
        const isbn = $(e.target).val().trim();
        if (isbn.length < 10) return;

        this.toggleLoading(true);

        try {
            // Fetching from Google Books API
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            
            if (response.data.totalItems > 0) {
                const bookInfo = response.data.items[0].volumeInfo;
                
                // Populate form fields
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

    toggleLoading(show) {
        if (show) this.$loadingIndicator.show();
        else this.$loadingIndicator.hide();      
    },

    handleSubmit(e) {
        e.preventDefault();

        // Basic validation 
        const titleVal = this.formInputs.title.val().trim();
        if (!titleVal) {
            this.showNotification('Book title is required.', 'error');
            return;
        }

        const bookData = {
            title: titleVal,
            author: this.formInputs.author.val().trim(),
            genre: this.formInputs.genre.val().trim(),
            status: this.formInputs.status.val(),
            note: this.formInputs.note.val().trim(),
            isbn: this.formInputs.isbn.val().trim(),
            cover: this.formInputs.cover.val().trim() || 'https://via.placeholder.com/120x160?text=No+Cover'
        };

        // Handle either updating an existing book or adding a new one
        if (this.editingId) {
            // Edit existing entry
            const index = this.data.findIndex(b => b.id === this.editingId);
            if (index !== -1) {
                this.data[index] = { 
                    ...this.data[index], // Preserve ID, isFavorite, and dateAdded
                    ...bookData 
                };
                this.showNotification('Book updated.', 'success');
            }
            this.editingId = null;
            this.$btnAdd.text('ADD BOOK').css('background-color', '');    
        } else {
            // Create new entry
            this.data.push({
                id: Date.now(),
                isFavorite: false,
                dateAdded: new Date(),
                ...bookData
            });
            this.showNotification('Book added.', 'success');
        }

        this.saveData();        // Persist data
        this.render();          // Refresh display
        this.$form[0].reset();  // Clear the form
    },

    // Delete a book
    deleteBook(e) {
        if (confirm('Are you sure you want to delete this book?')) {
            const id = $(e.target).closest('.book-card').data('id');
            this.data = this.data.filter(b => b.id !== id);
            this.saveData();
            this.render();
        }
    },

    // Edit book details
    editBook(e) {
        const id = $(e.target).closest('.book-card').data('id');
        const book = this.data.find(b => b.id === id);
        if (!book) return;

        // Fill form fields with existing values
        this.formInputs.title.val(book.title);
        this.formInputs.author.val(book.author);
        this.formInputs.genre.val(book.genre);
        this.formInputs.status.val(book.status);
        this.formInputs.note.val(book.note);
        this.formInputs.isbn.val(book.isbn);
        this.formInputs.cover.val(book.cover);

        this.editingId = id;
        this.$btnAdd.text('SAVE CHANGES').css('background-color', '#e0a800');
        
        // Smoothly scroll to the top of the page
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    },

    toggleFavorite(e) {
        const id = $(e.target).closest('.book-card').data('id');
        const book = this.data.find(b => b.id === id);
        if (book) {
            book.isFavorite = !book.isFavorite;
            this.saveData();
            this.render();
        }
    },

    toggleStatus(e) {
        const id = $(e.target).closest('.book-card').data('id');
        const book = this.data.find(b => b.id === id);
        if (book) {
            const statuses = ['not read', 'currently reading', 'read'];
            let currentIdx = statuses.indexOf(book.status);
            let nextIdx = (currentIdx + 1) % statuses.length;
            book.status = statuses[nextIdx];
            this.saveData();
            this.render();
        }
    },

    // Switch between display filters
    handleFilter(e) {
        this.$filterBtns.removeClass('active');
        const btn = $(e.target);
        btn.addClass('active');
        this.currentFilter = btn.data('filter');
        this.render();
    },

    render() {
        // Handle filtration and sorting logic
        const query = this.$searchInput.val().toLowerCase();
        const sortBy = this.$sortSelect.val();

        let filtered = this.data.filter(book => {
            // Apply current filter
            if (this.currentFilter === 'favorites' && !book.isFavorite) return false;
            if (this.currentFilter !== 'all' && this.currentFilter !== 'favorites' && book.status !== this.currentFilter) return false;
            
            // Search matching
            const textMatch = book.title.toLowerCase().includes(query) || 
                              book.author.toLowerCase().includes(query);
            return textMatch;
        });

        // Sort books
        filtered.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return new Date(b.dateAdded) - new Date(a.dateAdded); // Newest first
        });

        // Update statistics (calculated from global data, not filtered)
        $('#stat-total').text(this.data.length);
        $('#stat-read').text(this.data.filter(b => b.status === 'read').length);
        $('#stat-not-read').text(this.data.filter(b => b.status === 'not read').length);
        $('#stat-reading').text(this.data.filter(b => b.status === 'reading').length);

        // HTML Generation
        if (filtered.length === 0) {
            this.$container.html('<p style="text-align:center; color:#666;">No books found.</p>');
            return;
        }

        // Map data to an array of HTML strings and join them
        const htmlContent = filtered.map(book => {
            const favText = book.isFavorite ? '★ Favorited' : '☆ Favorite';
            const favClass = book.isFavorite ? 'is-fav' : '';
            
            return `
            <div class="book-card" data-id="${book.id}">
                <img src="${this.escapeHtml(book.cover)}" alt="Cover" class="book-cover">
                <div class="book-details">
                    <h3>${this.escapeHtml(book.title)}</h3>
                    <div class="book-meta">
                        <strong>Author:</strong> ${this.escapeHtml(book.author)} <br>
                        <strong>Genre:</strong> ${this.escapeHtml(book.genre)} <br>
                        <small>ISBN: ${this.escapeHtml(book.isbn)}</small>
                    </div>
                    <div class="book-note">
                        <strong>Note:</strong> ${book.note ? this.escapeHtml(book.note) : '<em>No notes added</em>'}
                    </div>
                    <div class="card-actions">
                        <button class="status-badge">Status: <b>${this.escapeHtml(book.status)}</b></button>
                        <div>
                            <button class="btn-favorite ${favClass}">${favText}</button>
                            <button class="btn-delete">Delete</button>
                            <button class="btn-edit">Edit</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join(''); // Join the array into one long string

        // Inject content into the DOM
        this.$container.html(htmlContent);
    },

    // Simple replacement for native alert()
    showNotification(message, type = 'info') {
        // Ensure notification element exists; create it if not
        let $notif = $('#app-notification');
        if ($notif.length === 0) {
            $('body').append('<div id="app-notification" style="position:fixed; top:20px; right:20px; padding:15px; background:#333; color:white; border-radius:5px; z-index:1000; display:none;"></div>');
            $notif = $('#app-notification');
        }

        const color = type === 'error' ? '#d9534f' : (type === 'success' ? '#5cb85c' : '#333');
        $notif.css('background-color', color).text(message).fadeIn().delay(3000).fadeOut();
    },

    // XSS Protection helper (escaping HTML characters)
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

// Initialize the app once the document is fully loaded
$(document).ready(() => {
    App.init();
});