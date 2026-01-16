const BASE_API_URL = 'https://www.googleapis.com/books/v1';
const STORAGE_KEY = 'myLibrary';
const LAST_SEARCH_KEY = 'lastSearch';


const $searchResultsContainer = $('#search-results');
const modalContainer = document.querySelector('#book-detail-modal');
const $searchForm = $('#search-form');


const getLibraryFromStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveBookToLibrary = (item, category) => {
  const library = getLibraryFromStorage();
  if (library.some((b) => b.id === item.id)) {
    return;
  }
  const book = item.volumeInfo;
  const bookData = {
    id: item.id,
    title: book.title,
    authors: book.authors,
    thumbnail: book.imageLinks?.thumbnail || '',
    category,
    rating: 0,
    note: '',
    dateAdded: new Date().toISOString(),
  };
  library.push(bookData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
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
  const books = items.map((item) => {
    const book = item.volumeInfo;
    const thumbnail = book.imageLinks?.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover';
    const title = book.title || 'Bez názvu';
    const authors = book.authors?.join(', ') || 'Neznámý autor';
    const $card = $(`
      <div class="card" style="cursor: pointer;">
        <img src="${thumbnail}" class="card-img-top" alt="${title}">
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <p class="card-text">${authors}</p>
        </div>
      </div>
    `);
    $card.on('click', async () => {
      $(modalContainer).find('.modal-body').html(`
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Načítání...</span>
          </div>
        </div>
      `);
      const modal = new bootstrap.Modal(modalContainer);
      modal.show();
      try {
        const detailsItem = await fetchBookDetails(item.id);
        renderBookDetails(detailsItem);
      } catch (err) {
        console.error(err);
        $(modalContainer).find('.modal-body').html(`
          <div class="alert alert-danger">
            Chyba při načítání detailu knihy. Zkuste to prosím znovu.
          </div>
        `);
      }
    });
    return $card.get(0);
  });
  $searchResultsContainer.empty().append(books);
};

const renderBookDetails = (item) => {
  const book = item.volumeInfo;
  const library = getLibraryFromStorage();
  const existingBook = library.find((b) => b.id === item.id);
  const { title, authors, imageLinks, description, publishedDate } = book;
  const $modalBody = $(modalContainer).find('.modal-body');
  let addSection = '';
  if (existingBook) {
    addSection = `
      <div class="alert alert-info">
        Kniha je již v tvé knihovně v kategorii: <strong>${existingBook.category}</strong>
      </div>
    `;
  } else {
    addSection = `
      <h4>Přidat do knihovny:</h4>
      <select id="category-select" class="form-select">
        <option value="Chci přečíst">Chci přečíst</option>
        <option value="Právě čtu">Právě čtu</option>
        <option value="Přečteno">Přečteno</option>
      </select>
      <br>
      <button id="add-to-library-btn" class="btn btn-primary">Přidat do knihovny</button>
    `;
  }
  $modalBody.html(`
    <div>
      <img src="${imageLinks?.thumbnail || ''}" alt="${title || ''}" style="max-width: 200px;">
      <h3>${title || 'Bez názvu'}</h3>
      <p><strong>Autor:</strong> ${authors?.join(', ') || 'Neznámý'}</p>
      <p><strong>Popis:</strong> <span id="book-description"></span></p>
      <p><strong>Rok vydání:</strong> ${publishedDate || 'N/A'}</p>
      <hr>
      ${addSection}
    </div>
  `);
  $modalBody.find('#book-description').text(description || 'Popis není k dispozici');
  if (!existingBook) {
    $modalBody.find('#add-to-library-btn').on('click', () => {
      const category = $modalBody.find('#category-select').val();
      saveBookToLibrary(item, category);


      const modal = bootstrap.Modal.getInstance(modalContainer);
      modal.hide();
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


$searchForm.on('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData($searchForm.get(0));
  const { author, title, genre } = Object.fromEntries(formData);
  if (!author && !title && !genre) {
    return;
  }
  fetchAndRenderSearchResults(author, title, genre, { pushUrl: true });
});

window.addEventListener('popstate', () => {
  const { author, title, genre } = loadSearchFromUrl();
  setFormValues({ author, title, genre });
  if (author || title || genre) {
    fetchAndRenderSearchResults(author, title, genre, { pushUrl: false });
  } else {
    $searchResultsContainer.empty();
  }
});

(async () => {
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
