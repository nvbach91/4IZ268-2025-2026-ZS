const BASE_API_URL = 'https://www.googleapis.com/books/v1';
const STORAGE_KEY = 'myLibrary';
const LAST_SEARCH_KEY = 'lastSearch';

const CATEGORY_LABELS = {
  'want-to-read': 'Chci přečíst',
  'currently-reading': 'Právě čtu',
  finished: 'Přečteno',
};

const $searchResultsContainer = $('#search-results');
const $searchForm = $('#search-form');
const $searchSection = $('#search-section');
const $librarySection = $('#library-section');
const $navSearch = $('#nav-search');
const $navLibrary = $('#nav-library');
const $searchModalContainer = $('#book-detail-modal');
const $libraryModalContainer = $('#edit-book-modal');
const $searchModalBody = $('#book-detail-modal .modal-body');
const $libraryModalBody = $('#edit-book-modal .modal-body');
const $categorySections = $('#category-sections');
const $allBooksContainer = $('#all-books');
const $wantToRead = $('#want-to-read');
const $currentlyReading = $('#currently-reading');
const $finished = $('#finished');
const $statWant = $('#stat-want');
const $statReading = $('#stat-reading');
const $statFinished = $('#stat-finished');
const $statTotal = $('#stat-total');
const $filterButtons = $('[data-filter]');

let currentFilter = 'all';

const formatPublishedDate = (publishedDate) => {
  if (!publishedDate) return 'N/A';

  const parts = String(publishedDate).split('-');
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (year && month && day) return `${day}.${month}.${year}`;
  if (year && month) return `${month}.${year}`;
  if (year) return year;

  return String(publishedDate);
};

const showSection = (section) => {
  if (section === 'search') {
    $searchSection.show();
    $librarySection.hide();
    $navSearch.addClass('active');
    $navLibrary.removeClass('active');

    const url = new URL(location.href);
    url.searchParams.delete('section');
    url.searchParams.delete('filter');
    history.pushState({}, '', url);
  } else if (section === 'library') {
    $searchSection.hide();
    $librarySection.show();
    $navSearch.removeClass('active');
    $navLibrary.addClass('active');

    const url = new URL(location.href);
    url.searchParams.set('section', 'library');
    history.pushState({}, '', url);

    displayLibrary(currentFilter);
  }
};

$navSearch.on('click', () => showSection('search'));
$navLibrary.on('click', () => showSection('library'));

const getLibraryFromStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveBookToLibrary = (item, category) => {
  const library = getLibraryFromStorage();

  if (!CATEGORY_LABELS[category]) return;
  if (library.some((b) => b.id === item.id)) return;

  const book = item.volumeInfo || {};
  const bookData = {
    id: item.id,
    title: book.title || '',
    authors: book.authors || [],
    thumbnail: book.imageLinks?.thumbnail || '',
    category,
    rating: 0,
    note: '',
    dateAdded: new Date().toISOString(),
    publishedDate: book.publishedDate || '',
    language: book.language || '',
    pageCount: book.pageCount || 0,
    infoLink: book.infoLink || '',
    previewLink: book.previewLink || '',
    canonicalVolumeLink: book.canonicalVolumeLink || '',
  };

  library.push(bookData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
};

const removeBookFromLibrary = (bookId) => {
  let library = getLibraryFromStorage();
  library = library.filter((book) => book.id !== bookId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  displayLibrary(currentFilter);
};

const updateBookInLibrary = (bookId, updates) => {
  const library = getLibraryFromStorage();
  const bookIndex = library.findIndex((book) => book.id === bookId);

  if (bookIndex !== -1) {
    library[bookIndex] = { ...library[bookIndex], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }
};

const saveSearchToUrl = ({ author, title, genre }) => {
  const url = new URL(location.href);
  url.searchParams.delete('author');
  url.searchParams.delete('title');
  url.searchParams.delete('genre');

  if (author) url.searchParams.set('author', author);
  if (title) url.searchParams.set('title', title);
  if (genre) url.searchParams.set('genre', genre);

  history.pushState({}, '', url);
};

const loadSearchFromUrl = () => {
  const url = new URL(location.href);
  return {
    author: url.searchParams.get('author') || '',
    title: url.searchParams.get('title') || '',
    genre: url.searchParams.get('genre') || '',
  };
};

const setFormValues = ({ author = '', title = '', genre = '' }) => {
  $searchForm.find('input[name="author"]').val(author);
  $searchForm.find('input[name="title"]').val(title);
  $searchForm.find('select[name="genre"]').val(genre);
};

const saveFilterToUrl = (filter) => {
  const url = new URL(location.href);
  url.searchParams.delete('filter');
  if (filter && filter !== 'all') url.searchParams.set('filter', filter);
  history.pushState({}, '', url);
};

const loadFilterFromUrl = () => {
  const url = new URL(location.href);
  return url.searchParams.get('filter') || 'all';
};

const setActiveFilterButton = (filter) => {
  $filterButtons.removeClass('btn-primary').addClass('btn-outline-primary');

  const $active = $filterButtons.filter(`[data-filter="${filter}"]`);
  if ($active.length) {
    $active.removeClass('btn-outline-primary').addClass('btn-primary');
  }
};

const fetchBookSearchResults = async (author, title, genre) => {
  const queryParts = [];
  if (author) queryParts.push(`inauthor:${author}`);
  if (title) queryParts.push(`intitle:${title}`);
  if (genre) queryParts.push(`subject:${genre}`);

  if (queryParts.length === 0) return { items: [] };

  const query = queryParts.join(' ');
  const url = `${BASE_API_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=40`;
  return await $.getJSON(url);
};

const fetchBookDetails = async (bookId) => {
  const url = `${BASE_API_URL}/volumes/${bookId}`;
  return await $.getJSON(url);
};

const renderBookSearchResults = (data) => {
  const { items } = data;

  if (!items || items.length === 0) {
    $searchResultsContainer.html('<p>Žádné knihy nenalezeny.</p>');
    return;
  }

  const library = getLibraryFromStorage();
  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const book = item.volumeInfo || {};
    const thumbnail =
      book.imageLinks?.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover';
    const title = book.title || 'Bez názvu';
    const authors = book.authors?.join(', ') || 'Neznámý autor';

    const existingBook = library.find((b) => b.id === item.id);
    const statusBadge = existingBook
      ? `<div class="book-status-badge">✓ ${CATEGORY_LABELS[existingBook.category] || existingBook.category}</div>`
      : '';

    const cardDiv = document.createElement('div');

    cardDiv.className = 'card';
    cardDiv.style.cursor = 'pointer';
    cardDiv.style.position = 'relative';
    cardDiv.innerHTML = `
      ${statusBadge}
      <img src="${thumbnail}" class="card-img-top" alt="${title}">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${authors}</p>
      </div>
    `;

    cardDiv.addEventListener('click', async () => {
      $searchModalBody.html(`
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Načítání...</span>
          </div>
        </div>
      `);

      const modal = new bootstrap.Modal($searchModalContainer.get(0));
      modal.show();

      try {
        const detailsItem = await fetchBookDetails(item.id);
        renderSearchBookDetails(detailsItem);
      } catch (err) {
        console.error(err);
        $searchModalBody.html(`
          <div class="alert alert-danger">
            Chyba při načítání detailu knihy. Zkuste to prosím znovu.
          </div>
        `);
      }
    });

    fragment.appendChild(cardDiv);
  });

  $searchResultsContainer.empty().append(fragment);
};

const renderSearchBookDetails = (item) => {
  const book = item.volumeInfo || {};
  const library = getLibraryFromStorage();
  const existingBook = library.find((b) => b.id === item.id);

  const {
    title,
    authors,
    imageLinks,
    description,
    publishedDate,
    language,
    pageCount,
    infoLink,
    previewLink,
    canonicalVolumeLink,
  } = book;

  let addSection = '';
  if (existingBook) {
    addSection = `
      <div class="alert alert-info">
        Kniha je již v tvé knihovně v kategorii:
        <strong>${CATEGORY_LABELS[existingBook.category] || existingBook.category}</strong>
      </div>
    `;
  } else {
    addSection = `
      <h4>Přidat do knihovny:</h4>
      <select id="category-select" class="form-select">
        <option value="want-to-read">Chci přečíst</option>
        <option value="currently-reading">Právě čtu</option>
        <option value="finished">Přečteno</option>
      </select>
      <br>
      <button id="add-to-library-btn" class="btn btn-primary">Přidat do knihovny</button>
    `;
  }

  $searchModalBody.html(`
    <div>
      <img src="${imageLinks?.thumbnail || ''}" alt="${title || ''}" style="max-width: 200px;">
      <h3>${title || 'Bez názvu'}</h3>
      <p><strong>Autor:</strong> ${authors?.join(', ') || 'Neznámý'}</p>
      <p><strong>Datum vydání:</strong> ${formatPublishedDate(publishedDate)}</p>
      <p><strong>Jazyk:</strong> ${language ? language.toUpperCase() : 'N/A'}</p>
      <p><strong>Počet stran:</strong> ${pageCount || 'N/A'}</p>

      <p><strong>Odkazy:</strong></p>
      <ul class="book-links mb-0">
        ${infoLink ? `<li><a href="${infoLink}" target="_blank" rel="noopener">Info</a></li>` : ''}
        ${previewLink ? `<li><a href="${previewLink}" target="_blank" rel="noopener">Náhled</a></li>` : ''}
        ${canonicalVolumeLink ? `<li><a href="${canonicalVolumeLink}" target="_blank" rel="noopener">Oficiální odkaz</a></li>` : ''}
      </ul>

      <hr>
      ${addSection}

      <hr>
      <div>
        <p><strong>Popis:</strong></p>
        <div id="book-description"></div>
      </div>
    </div>
  `);

  $searchModalBody.find('#book-description').html(description || 'Popis není k dispozici');

 if (!existingBook) {
    $searchModalBody.find('#add-to-library-btn').on('click', async () => {
      const category = $searchModalBody.find('#category-select').val();
      saveBookToLibrary(item, category);

      const modal = bootstrap.Modal.getInstance($searchModalContainer.get(0));
      if (modal) modal.hide();

      const formData = new FormData($searchForm.get(0));
      const { author, title, genre } = Object.fromEntries(formData);
      if (author || title || genre) {
        await fetchAndRenderSearchResults(author, title, genre, { pushUrl: false });
      }
    });
  }
};



const fetchAndRenderSearchResults = async (author, title, genre, { pushUrl = true } = {}) => {
  try {
    $searchResultsContainer.html(`
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Načítání...</span>
        </div>
      </div>
    `);

    const data = await fetchBookSearchResults(author, title, genre);
    renderBookSearchResults(data);

    const state = { author, title, genre };
    localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(state));
    if (pushUrl) saveSearchToUrl(state);
  } catch (err) {
    console.error(err);
    $searchResultsContainer.html(`
      <div class="alert alert-danger">
        Chyba při vyhledávání knih. Zkontrolujte připojení k internetu a zkuste to znovu.
      </div>
    `);
  }
};

const showEditModal = (bookId) => {
  const library = getLibraryFromStorage();
  const book = library.find((b) => b.id === bookId);
  if (!book) return;

  const stars = '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating);

  $libraryModalBody.html(`
    <div>
      <img src="${book.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover'}" alt="${book.title}" style="max-width: 200px;">
      <h3>${book.title}</h3>
      <p><strong>Autor:</strong> ${book.authors?.join(', ') || 'Neznámý'}</p>
      <p><strong>Datum vydání:</strong> ${formatPublishedDate(book.publishedDate)}</p>
      <p><strong>Jazyk:</strong> ${book.language ? book.language.toUpperCase() : 'N/A'}</p>
      <p><strong>Počet stran:</strong> ${book.pageCount || 'N/A'}</p>

      <p><strong>Odkazy:</strong></p>
      <ul>
        ${book.infoLink ? `<li><a href="${book.infoLink}" target="_blank" rel="noopener">Info</a></li>` : ''}
        ${book.previewLink ? `<li><a href="${book.previewLink}" target="_blank" rel="noopener">Náhled</a></li>` : ''}
        ${book.canonicalVolumeLink ? `<li><a href="${book.canonicalVolumeLink}" target="_blank" rel="noopener">Oficiální odkaz</a></li>` : ''}
      </ul>

      <hr>
      <h4>Kategorie:</h4>
      <p>${CATEGORY_LABELS[book.category] || book.category}</p>

      <h4>Moje hodnocení:</h4>
      <p style="font-size: 24px; color: gold;">${book.rating > 0 ? stars : 'Bez hodnocení'}</p>

      <h4>Poznámka:</h4>
      <p>${book.note || 'Žádná poznámka'}</p>

      <hr>
      <button id="edit-mode-btn" class="btn btn-warning">Upravit</button>
      <button id="delete-book-btn" class="btn btn-danger">Smazat knihu</button>
    </div>
  `);

  $libraryModalBody.find('#edit-mode-btn').on('click', () => showEditMode(book));

  $libraryModalBody.find('#delete-book-btn').on('click', () => {
    removeBookFromLibrary(bookId);
    const modalInstance = bootstrap.Modal.getInstance($libraryModalContainer.get(0));
    if (modalInstance) modalInstance.hide();
  });

  const modalInstance = new bootstrap.Modal($libraryModalContainer.get(0));
  modalInstance.show();
};

const showEditMode = (book) => {
  const starsHtml = Array.from({ length: 5 }, (_, i) => {
    const ratingValue = i + 1;
    const filled = ratingValue <= book.rating ? '★' : '☆';
    return `<span class="star" data-rating="${ratingValue}" style="font-size: 30px; cursor: pointer; color: gold;">${filled}</span>`;
  }).join('');

  $libraryModalBody.html(`
    <div>
      <img src="${book.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover'}" alt="${book.title}" style="max-width: 200px;">
      <h3>${book.title}</h3>
      <p><strong>Autor:</strong> ${book.authors?.join(', ') || 'Neznámý'}</p>

      <hr>
      <h4>Kategorie:</h4>
      <select id="category-select" class="form-select">
        <option value="want-to-read" ${book.category === 'want-to-read' ? 'selected' : ''}>Chci přečíst</option>
        <option value="currently-reading" ${book.category === 'currently-reading' ? 'selected' : ''}>Právě čtu</option>
        <option value="finished" ${book.category === 'finished' ? 'selected' : ''}>Přečteno</option>
      </select>

      <br>
      <h4>Hodnocení:</h4>
      <div id="rating-stars">${starsHtml}</div>

      <br>
      <h4>Poznámka:</h4>
      <textarea id="note-input" class="form-control" rows="4"></textarea>

      <br>
      <button id="save-changes-btn" class="btn btn-success">Uložit změny</button>
      <button id="cancel-btn" class="btn btn-secondary">Zrušit</button>
    </div>
  `);

  $libraryModalBody.find('#note-input').val(book.note || '');

  let currentRating = book.rating;
  const $stars = $libraryModalBody.find('.star');

  $stars.on('click', function () {
    currentRating = parseInt($(this).data('rating'), 10);
    $stars.each(function (index) {
      $(this).text(index < currentRating ? '★' : '☆');
    });
  });

  $libraryModalBody.find('#save-changes-btn').on('click', () => {
    const category = $libraryModalBody.find('#category-select').val();
    const note = $libraryModalBody.find('#note-input').val();

    updateBookInLibrary(book.id, { category, rating: currentRating, note });
    displayLibrary(currentFilter);

    const modalInstance = bootstrap.Modal.getInstance($libraryModalContainer.get(0));
    if (modalInstance) modalInstance.hide();
  });

  $libraryModalBody.find('#cancel-btn').on('click', () => showEditModal(book.id));
};

const createBookCard = (book) => {
  const stars = book.rating > 0 ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : '';

  const cardDiv = document.createElement('div');



  cardDiv.className = 'card';
  cardDiv.style.cursor = 'pointer';
  cardDiv.innerHTML = `
    <img src="${book.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover'}" class="card-img-top" alt="${book.title}">
    <div class="card-body">
      <h5 class="card-title">${book.title}</h5>
      <p class="card-text">${book.authors?.join(', ') || 'Neznámý autor'}</p>
      ${stars ? `<p style="color: gold; font-size: 18px;">${stars}</p>` : ''}
    </div>
  `;

  cardDiv.addEventListener('click', () => showEditModal(book.id));
  return cardDiv;
};

const displayLibrary = (filter = 'all') => {
  const library = getLibraryFromStorage();

  const wantCount = library.filter((b) => b.category === 'want-to-read').length;
  const readingCount = library.filter((b) => b.category === 'currently-reading').length;
  const finishedCount = library.filter((b) => b.category === 'finished').length;

  $statWant.text(wantCount);
  $statReading.text(readingCount);
  $statFinished.text(finishedCount);
  $statTotal.text(library.length);

  $wantToRead.empty();
  $currentlyReading.empty();
  $finished.empty();
  $allBooksContainer.empty();

  if (filter === 'all') {
    $categorySections.show();
    $allBooksContainer.hide();

    const wantFragment = document.createDocumentFragment();
    const readingFragment = document.createDocumentFragment();
    const finishedFragment = document.createDocumentFragment();

    library.forEach((book) => {
      const bookCard = createBookCard(book);

      if (book.category === 'want-to-read') {
        wantFragment.appendChild(bookCard);
      } else if (book.category === 'currently-reading') {
        readingFragment.appendChild(bookCard);
      } else if (book.category === 'finished') {
        finishedFragment.appendChild(bookCard);
      }
    });

    $wantToRead.append(wantFragment);
    $currentlyReading.append(readingFragment);
    $finished.append(finishedFragment);
  } else {
    $categorySections.hide();
    $allBooksContainer.css('display', 'grid').show();

    const filteredBooks = library.filter((book) => book.category === filter);

    if (filteredBooks.length === 0) {
      $allBooksContainer.html('<p>Žádné knihy v této kategorii.</p>');
    } else {
      const fragment = document.createDocumentFragment();
      filteredBooks.forEach((book) => fragment.appendChild(createBookCard(book)));
      $allBooksContainer.append(fragment);
    }
  }
};

$searchForm.on('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData($searchForm.get(0));
  let { author, title, genre } = Object.fromEntries(formData);

  author = author ? author.trim().replace(/[<>]/g, '') : '';
  title = title ? title.trim().replace(/[<>]/g, '') : '';
  genre = genre ? genre.trim() : '';

  if (!author && !title && !genre) return;

  await fetchAndRenderSearchResults(author, title, genre, { pushUrl: true });
});

$filterButtons.on('click', function () {
  const filter = $(this).attr('data-filter');
  currentFilter = filter;
  saveFilterToUrl(filter);
  setActiveFilterButton(filter);
  displayLibrary(filter);
});

window.addEventListener('popstate', () => {
  const url = new URL(location.href);
  const section = url.searchParams.get('section');

  if (section === 'library') {
    showSection('library');
    const filter = loadFilterFromUrl();
    currentFilter = filter;
    setActiveFilterButton(filter);
    displayLibrary(filter);
  } else {
    showSection('search');
    const { author, title, genre } = loadSearchFromUrl();
    setFormValues({ author, title, genre });

    if (author || title || genre) {
      fetchAndRenderSearchResults(author, title, genre, { pushUrl: false });
    } else {
      $searchResultsContainer.empty();
    }
  }
});

(async () => {
  const url = new URL(location.href);
  const section = url.searchParams.get('section');

  if (section === 'library') {
    showSection('library');
    const filter = loadFilterFromUrl();
    currentFilter = filter;
    setActiveFilterButton(filter);
    displayLibrary(filter);
    return;
  }

  showSection('search');

  const urlState = loadSearchFromUrl();
  if (urlState.author || urlState.title || urlState.genre) {
    setFormValues(urlState);
    await fetchAndRenderSearchResults(urlState.author, urlState.title, urlState.genre, {
      pushUrl: false,
    });
    return;
  }

  const lastSearch = localStorage.getItem(LAST_SEARCH_KEY);
  if (lastSearch) {
    const storedState = JSON.parse(lastSearch);
    setFormValues(storedState);
    await fetchAndRenderSearchResults(storedState.author, storedState.title, storedState.genre, {
      pushUrl: true,
    });
  }
})();
