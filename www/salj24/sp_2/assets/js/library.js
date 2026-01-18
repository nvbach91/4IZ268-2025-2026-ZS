const STORAGE_KEY = 'myLibrary';
let currentFilter = 'all';

const getLibraryFromStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
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
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach((btn) => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline-primary');
  });

  const active = document.querySelector(`[data-filter="${filter}"]`);
  if (active) {
    active.classList.remove('btn-outline-primary');
    active.classList.add('btn-primary');
  }
};

const showEditModal = (bookId) => {
  const library = getLibraryFromStorage();
  const book = library.find((b) => b.id === bookId);
  if (!book) return;
  const modalContainer = document.querySelector('#edit-book-modal');
  const modalBody = modalContainer.querySelector('.modal-body');
  const stars = '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating);
  modalBody.innerHTML = `
    <div>
      <img src="${book.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover'}" alt="${book.title}" style="max-width: 200px;">
      <h3>${book.title}</h3>
      <p><strong>Autor:</strong> ${book.authors?.join(', ') || 'Neznámý'}</p>
      <hr>
      <h4>Kategorie:</h4>
      <p>${book.category}</p>
      <h4>Hodnocení:</h4>
      <p style="font-size: 24px; color: gold;">${book.rating > 0 ? stars : 'Bez hodnocení'}</p>
      <h4>Poznámka:</h4>
      <p>${book.note || 'Žádná poznámka'}</p>
      <hr>
      <button id="edit-mode-btn" class="btn btn-warning">Upravit</button>
      <button id="delete-book-btn" class="btn btn-danger">Smazat knihu</button>
    </div>
  `;

  modalBody.querySelector('#edit-mode-btn').addEventListener('click', () => {
    showEditMode(book, modalContainer);
  });

  modalBody.querySelector('#delete-book-btn').addEventListener('click', () => {
    removeBookFromLibrary(bookId);
    const modalInstance = bootstrap.Modal.getInstance(modalContainer);
    if (modalInstance) modalInstance.hide();
  });

  const modalInstance = new bootstrap.Modal(modalContainer);
  modalInstance.show();
};

const showEditMode = (book, modalContainer) => {
  const modalBody = modalContainer.querySelector('.modal-body');
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= book.rating ? '★' : '☆';
    starsHtml += `<span class="star" data-rating="${i}" style="font-size: 30px; cursor: pointer; color: gold;">${filled}</span>`;
  }

  modalBody.innerHTML = `
    <div>
      <img src="${book.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover'}" alt="${book.title}" style="max-width: 200px;">
      <h3>${book.title}</h3>
      <p><strong>Autor:</strong> ${book.authors?.join(', ') || 'Neznámý'}</p>
      <hr>
      <h4>Kategorie:</h4>
      <select id="category-select" class="form-select">
        <option value="Chci přečíst" ${book.category === 'Chci přečíst' ? 'selected' : ''}>Chci přečíst</option>
        <option value="Právě čtu" ${book.category === 'Právě čtu' ? 'selected' : ''}>Právě čtu</option>
        <option value="Přečteno" ${book.category === 'Přečteno' ? 'selected' : ''}>Přečteno</option>
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
  `;


  modalBody.querySelector('#note-input').value = book.note || '';
  let currentRating = book.rating;
  const stars = modalBody.querySelectorAll('.star');
  stars.forEach((star) => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.getAttribute('data-rating'), 10);
      stars.forEach((s, index) => {
        s.textContent = index < currentRating ? '★' : '☆';
      });
    });
  });

  modalBody.querySelector('#save-changes-btn').addEventListener('click', () => {
    const category = modalBody.querySelector('#category-select').value;
    const note = modalBody.querySelector('#note-input').value;

    updateBookInLibrary(book.id, {
      category,
      rating: currentRating,
      note,
    });

    displayLibrary(currentFilter);

    const modalInstance = bootstrap.Modal.getInstance(modalContainer);
    if (modalInstance) modalInstance.hide();
  });

  modalBody.querySelector('#cancel-btn').addEventListener('click', () => {
    showEditModal(book.id);
  });
};


const createBookCard = (book) => {
  const wrapper = document.createElement('div');

  const stars =
    book.rating > 0 ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : '';

  wrapper.innerHTML = `
    <div class="card" style="cursor: pointer;">
      <img src="${book.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover'}" class="card-img-top" alt="${book.title}">
      <div class="card-body">
        <h5 class="card-title">${book.title}</h5>
        <p class="card-text">${book.authors?.join(', ') || 'Neznámý autor'}</p>
        ${stars ? `<p style="color: gold; font-size: 18px;">${stars}</p>` : ''}
      </div>
    </div>
  `;

  wrapper.firstElementChild.addEventListener('click', () => showEditModal(book.id));
  return wrapper;
};

const displayLibrary = (filter = 'all') => {
  const library = getLibraryFromStorage();
  const categorySections = document.getElementById('category-sections');
  const allBooksContainer = document.getElementById('all-books');
  const wantToRead = document.getElementById('want-to-read');
  const currentlyReading = document.getElementById('currently-reading');
  const finished = document.getElementById('finished');

  wantToRead.innerHTML = '';
  currentlyReading.innerHTML = '';
  finished.innerHTML = '';
  allBooksContainer.innerHTML = '';

  if (filter === 'all') {
    categorySections.style.display = 'block';
    allBooksContainer.style.display = 'none';

    library.forEach((book) => {
      const bookCard = createBookCard(book);

      if (book.category === 'Chci přečíst') {
        wantToRead.appendChild(bookCard);
      } else if (book.category === 'Právě čtu') {
        currentlyReading.appendChild(bookCard);
      } else if (book.category === 'Přečteno') {
        finished.appendChild(bookCard);
      }
    });
  } else {
    categorySections.style.display = 'none';
    allBooksContainer.style.display = 'grid';

    const filteredBooks = library.filter((book) => book.category === filter);

    if (filteredBooks.length === 0) {
      allBooksContainer.innerHTML = '<p>Žádné knihy v této kategorii.</p>';
    } else {
      filteredBooks.forEach((book) => {
        allBooksContainer.appendChild(createBookCard(book));
      });
    }
  }
};


const filterButtons = document.querySelectorAll('[data-filter]');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.getAttribute('data-filter');
    currentFilter = filter;
    saveFilterToUrl(filter);
    setActiveFilterButton(filter);
    displayLibrary(filter);
  });
});

window.addEventListener('popstate', () => {
  const filter = loadFilterFromUrl();
  currentFilter = filter;
  setActiveFilterButton(filter);
  displayLibrary(filter);
});

(() => {
  const filter = loadFilterFromUrl();
  currentFilter = filter;
  setActiveFilterButton(filter);
  displayLibrary(filter);
})();
