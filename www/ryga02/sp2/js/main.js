const App = {};

App.baseApiUrl = 'https://www.thecocktaildb.com/api/json/v1/1';
App.currentLang = 'EN';
App.ui = {};

App.escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

App.showSpinner = () => {
  App.ui.$results.html(`
    <div class="spinner-container">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `);
};

App.updateFavoritesCount = () => {
  const favorites = App.getFavorites();
  App.ui.$favCount.text(favorites.length);
};

App.addToFavorites = (drink) => {
  const favorites = App.getFavorites();
  if (!favorites.find(f => f.id === drink.id)) {
    favorites.push(drink);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    App.updateFavoritesCount();
  }
};

App.removeFromFavorites = (cocktailId) => {
  let favorites = App.getFavorites();
  favorites = favorites.filter(f => f.id.toString() !== cocktailId.toString());
  localStorage.setItem('favorites', JSON.stringify(favorites));
  App.updateFavoritesCount();
};

App.isFavorite = (cocktailId) => {
  const favorites = App.getFavorites();
  return favorites.some(f => f.id.toString() === cocktailId.toString());
};

App.getFavorites = () => {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
};

App.updateFavoriteButtons = () => {
  $('.favorite-btn').each(function () {
    const cocktailId = $(this).data('id');
    if (App.isFavorite(cocktailId)) {
      $(this).text('♥');
    } else {
      $(this).text('♡');
    }
  });
};

App.renderCocktails = (drinks) => {
  const count = drinks ? drinks.length : 0;
  const countHtml = `<div class="results-info mb-3">Found <strong>${count}</strong> cocktails</div>`;

  if (!drinks) {
    App.ui.$results.html(countHtml);
    return;
  }

  const html = drinks.map((drink) => {
    const safeName = App.escapeHtml(drink.strDrink);
    const safeId = App.escapeHtml(drink.idDrink);
    const safeThumb = App.escapeHtml(drink.strDrinkThumb);

    return `
      <div class="cocktail-card" data-id="${drink.idDrink}">
        <img src="${drink.strDrinkThumb}/preview" alt="${drink.strDrink}">
        <h3>${drink.strDrink}</h3>
        <div class="card-buttons">
          <button class="favorite-btn" data-id="${drink.idDrink}">♡</button>
          <button class="detail-link detail-btn" data-id="${drink.idDrink}">Recipe detail</button>
        </div>
      </div>
    `;
  }).join('');

  App.ui.$results.html(countHtml + `<div class="cocktails-grid">${html}</div>`);
  App.updateFavoriteButtons();
};

App.searchByName = (searchTerm) => {
  const sanitizedTerm = App.escapeHtml(searchTerm.trim());

  App.showSpinner();

  const url = `${App.baseApiUrl}/search.php?s=${encodeURIComponent(sanitizedTerm)}`;

  $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  })
    .done((data) => {
      App.renderCocktails(data.drinks);
    })
    .fail(() => {
      App.ui.$results.html('<p class="error">Error loading data</p>');
    });
};

App.filterByIngredient = (ingredient) => {
  const sanitizedIngredient = App.escapeHtml(ingredient);

  if (!sanitizedIngredient) {
    App.ui.$results.html('<p class="error">Select an ingredient</p>');
    return;
  }

  App.showSpinner();
  const url = `${App.baseApiUrl}/filter.php?i=${encodeURIComponent(sanitizedIngredient)}`;

  $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  })
    .done((data) => {
      App.renderCocktails(data.drinks);
    })
    .fail(() => {
      App.ui.$results.html('<p class="error">Error loading data</p>');
    });
};

App.getRandomCocktail = () => {
  App.showSpinner();

  const url = `${App.baseApiUrl}/random.php`;

  $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  })
    .done((data) => {
      App.renderCocktails(data.drinks);
    })
    .fail(() => {
      App.ui.$results.html('<p class="error">Error loading data</p>');
    });
};

App.loadAllCocktails = () => {
  App.showSpinner();
  const url = `${App.baseApiUrl}/search.php?f=a`;

  $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  })
    .done((data) => {
      App.renderCocktails(data.drinks);
    })
    .fail(() => {
      App.ui.$results.html('<p class="error">Error loading cocktails</p>');
    });
};

App.loadIngredients = () => {
  const url = `${App.baseApiUrl}/list.php?i=list`;

  $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  })
    .done((data) => {
      let items = data.drinks.map(item => item.strIngredient1);

      const extra = [
        "Light rum", "Lime juice", "Orange juice", "Passoa",
        "Pineapple juice", "Sugar syrup", "Tequila", "Vodka", "Whiskey"
      ];

      let finalMenu = [...new Set([...items, ...extra])].sort((a, b) => a.localeCompare(b));

      const options = finalMenu.map((name) => {
        const safeName = App.escapeHtml(name);
        return `<option value="${safeName}">${safeName}</option>`;
      }).join('');

      App.ui.$ingredientSelect.append(options);
      App.ui.$ingredientSelect.select2({
        placeholder: "Pick an ingredient...",
        allowClear: true,
        width: '100%'
      });

      console.log('Ingredience úspěšně načteny a spojeny.');
    })
    .fail((jqXHR, textStatus, error) => {
      console.error('Chyba při načítání ingrediencí z API:', textStatus, error);

      const backup = ["Gin", "Rum", "Tequila", "Vodka", "Whiskey"];
      const backupOptions = backup.map(name => {
        const safeName = App.escapeHtml(name);
        return `<option value="${safeName}">${safeName}</option>`;
      }).join('');

      App.ui.$ingredientSelect.append(backupOptions);
      App.ui.$ingredientSelect.select2({ placeholder: "Pick an ingredient (offline mode)" });
    });
};

App.showFavorites = () => {
  const favorites = App.getFavorites();

  if (favorites.length === 0) {
    App.ui.$results.html('<p class="error">You have no favorite cocktails</p>');
    return;
  }

  const html = favorites.map((drink) => {
    const safeName = App.escapeHtml(drink.name);
    const safeId = App.escapeHtml(drink.id);
    const safeThumb = App.escapeHtml(drink.thumb);

    return `
      <div class="cocktail-card" data-id="${safeId}">
          <img src="${safeThumb}/preview" alt="${safeName}">
          <h3>${safeName}</h3>
          <div class="card-buttons">
              <button class="favorite-btn" data-id="${safeId}">♥</button>
              <button class="detail-link detail-btn" data-id="${safeId}">Recipe detail</button>
          </div>
      </div>
    `;
  }).join('');

  App.ui.$results.html(`
      <div class="cocktails-grid">${html}</div>
  `);
};


App.showCocktailDetail = (cocktailId) => {
    if (!cocktailId) return;

    if (App.currentDrinkData && App.currentDrinkData.idDrink.toString() === cocktailId.toString()) {
        App.renderCocktailDetailModal(App.currentDrinkData);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('cocktailModal')).show();
        return; 
    }

    let modalElement = document.getElementById('cocktailModal');
    if (!modalElement) {
        const modalHtml = `
            <div class="modal fade" id="cocktailModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content"></div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('cocktailModal');
    }

    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    
    modalElement.querySelector('.modal-content').innerHTML = `
        <div class="modal-body text-center p-5">
            <div class="spinner-border text-danger"></div>
            <p class="mt-2">Loading recipe...</p>
        </div>`;
    
    modalInstance.show();

    $.getJSON(`${App.baseApiUrl}/lookup.php?i=${encodeURIComponent(cocktailId)}`)
        .done((data) => {
            if (data.drinks && data.drinks[0]) {
                App.currentDrinkData = data.drinks[0];
                App.renderCocktailDetailModal(App.currentDrinkData);
            }
        });
};
App.renderCocktailDetailModal = (drink) => {
  const safeName = App.escapeHtml(drink.strDrink);
  const safeId = App.escapeHtml(drink.idDrink);
  const safeThumb = App.escapeHtml(drink.strDrinkThumb);
  const safeCategory = App.escapeHtml(drink.strCategory || 'N/A');
  const safeAlcoholic = App.escapeHtml(drink.strAlcoholic || 'N/A');
  const safeGlass = App.escapeHtml(drink.strGlass || 'N/A');

  const langSuffix = (App.currentLang === 'EN' || !App.currentLang) ? '' : App.currentLang;
  const instructionKey = 'strInstructions' + langSuffix;
  const safeInstructions = App.escapeHtml(drink[instructionKey] || drink.strInstructions || 'No instructions.');

  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient) {
      ingredients.push(`
        <li class="my-2">
          <span><b>${App.escapeHtml(measure || '')}</b> ${App.escapeHtml(ingredient)}</span>
        </li>
      `);
    }
  }

 const modalContent = `
    <div class="modal-header">
      <h5 class="modal-title">${safeName}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body">
      <div class="text-center mb-3">
        <img src="${safeThumb}" alt="${safeName}" class="img-fluid rounded">
      </div>
      
      <div class="cocktail-info mb-3">
        <p><strong>Category:</strong> ${safeCategory}</p>
        <p><strong>Type:</strong> ${safeAlcoholic}</p>
        <p><strong>Glass:</strong> ${safeGlass}</p>
      </div>

      <h6>Ingredients:</h6>
      <ul class="ingredients-list">${ingredients.join('')}</ul>
      
      <div class="lang-controls-row">
        <h6>Instructions:</h6>
        <div class="modal-lang-group">
            <button type="button" class="modal-lang-btn ${App.currentLang === 'EN' ? 'active-lang' : ''}" data-lang="EN">EN</button>
            <button type="button" class="modal-lang-btn ${App.currentLang === 'DE' ? 'active-lang' : ''}" data-lang="DE">DE</button>
            <button type="button" class="modal-lang-btn ${App.currentLang === 'IT' ? 'active-lang' : ''}" data-lang="IT">IT</button>
            <button type="button" class="modal-lang-btn ${App.currentLang === 'FR' ? 'active-lang' : ''}" data-lang="FR">FR</button>
            <button type="button" class="modal-lang-btn ${App.currentLang === 'ES' ? 'active-lang' : ''}" data-lang="ES">ES</button>
        </div>
      </div>
      
      <p class="instructions">${safeInstructions}</p>

      <div class="text-center">
          <button class="favorite-btn" data-id="${safeId}">♡</button>
      </div>
    </div>
`;

  const modalTarget = document.querySelector('#cocktailModal .modal-content');
  if (modalTarget) {
      modalTarget.innerHTML = modalContent;
  }
  
  App.updateFavoriteButtons();
};

App.initMainPage = () => {
  console.log('Hlavní stránka načtena');

  App.loadIngredients();
  App.loadAllCocktails();

  App.ui.$searchForm.on('submit', (e) => {
    e.preventDefault(); 
    const searchTerm = App.ui.$searchInput.val().trim();
    App.searchByName(searchTerm);
  });

  App.ui.$ingredientBtn.on('click', () => {
    const ingredient = App.ui.$ingredientSelect.val();
    App.filterByIngredient(ingredient);
  });

  App.ui.$randomBtn.on('click', () => {
    App.getRandomCocktail();
  });

  App.ui.$favoritesBtn.on('click', () => {
    App.showFavorites();
  });


  $(document).on('click', '.cocktail-card', function (e) {
    if ($(e.target).closest('.favorite-btn').length) {
      return;
    }
    const cocktailId = $(this).data('id');
    App.showCocktailDetail(cocktailId);
  });
};

App.init = () => {
  App.ui = {
    $results: $('#results'),
    $favCount: $('#fav-count'),
    $searchInput: $('#search-input'),
    $searchForm: $('#search-form'),
    $ingredientSelect: $('#ingredient-select'),
    $ingredientBtn: $('#ingredient-btn'),
    $searchBtn: $('#search-btn'),
    $randomBtn: $('#random-btn'),
    $favoritesBtn: $('#show-favorites-btn')
  };

  if (App.ui.$results.length > 0) {
    App.initMainPage();
  }

  $(document).on('click', '.lang-switch-btn, .modal-lang-btn', function (e) {
    e.preventDefault();
    
    App.currentLang = $(this).data('lang');
    
    $('.lang-switch-btn, .modal-lang-btn').removeClass('active');
    $(`[data-lang="${App.currentLang}"]`).addClass('active');

    const modalElement = document.getElementById('cocktailModal');
    const isVisible = modalElement && modalElement.classList.contains('show');
    
    if (isVisible && App.currentDrinkData) {
      App.renderCocktailDetailModal(App.currentDrinkData);
    }
  });
  App.updateFavoritesCount();
  
 
  $(document).on('click', '.favorite-btn', function (e) {
    e.stopPropagation();
    const $btn = $(this);
    const cocktailId = $btn.data('id').toString();

    if (App.isFavorite(cocktailId)) {
      App.removeFromFavorites(cocktailId);
    } else {
      const $card = $btn.closest('.cocktail-card');
      let drinkData;

      if ($card.length) {
        drinkData = {
          id: cocktailId,
          name: $card.find('h3').text(),
          thumb: $card.find('img').attr('src').replace('/preview', ''),
        };
      } else {
        const categoryText = $('.cocktail-info p:contains("Category:")').text().replace('Category:', '').trim();

        drinkData = {
          id: cocktailId,
          name: $('#cocktailModal .modal-title').text(),
          thumb: $('#cocktailModal .modal-body img').attr('src')
        };
      }
      App.addToFavorites(drinkData);
    }
    App.updateFavoriteButtons();
  });
};


$(document).ready(() => {
  App.init();
});