const App = {};

App.baseApiUrl = 'https://www.thecocktaildb.com/api/json/v1/1';

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
  $('#results').html(`
    <div class="d-flex justify-content-center my-5">
      <div class="spinner-border text-danger" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `);
};

App.addToFavorites = (cocktailId) => {
  const favorites = App.getFavorites();
  if (!favorites.includes(cocktailId)) {
    favorites.push(cocktailId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log('Přidáno do oblíbených:', cocktailId);
  }
};

App.removeFromFavorites = (cocktailId) => {
  let favorites = App.getFavorites();
  favorites = favorites.filter(id => id !== cocktailId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  console.log('Odebráno z oblíbených:', cocktailId);
};

App.isFavorite = (cocktailId) => {
  const favorites = App.getFavorites();
  return favorites.includes(cocktailId);
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
  if (!drinks) {
    $('#results').html('<p class="error">The list is empty</p>');
    return;
  }

  const html = drinks.map((drink) => {
    const safeName = App.escapeHtml(drink.strDrink);
    const safeId = App.escapeHtml(drink.idDrink);
    const safeThumb = App.escapeHtml(drink.strDrinkThumb);

    return `
      <div class="cocktail-card" data-id="${safeId}">
        <img src="${safeThumb}/preview" alt="${safeName}">
        <h3>${safeName}</h3>
        <div class="card-buttons">
          <button class="favorite-btn" data-id="${safeId}">♡</button>
          <button class="detail-link detail-btn" data-id="${safeId}">Recipe detail</button>
        </div>
      </div>
    `;
  }).join('');

  $('#results').html(`<div class="cocktails-grid">${html}</div>`);
  App.updateFavoriteButtons();
};

App.searchByName = (searchTerm) => {
  const sanitizedTerm = App.escapeHtml(searchTerm.trim());

  if (!sanitizedTerm) {
    $('#results').html('<p class="error">Type the name of the cocktail</p>');
    return;
  }

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
      $('#results').html('<p class="error">Error loading data</p>');
    });
};

App.filterByIngredient = (ingredient) => {
  const sanitizedIngredient = App.escapeHtml(ingredient);

  if (!sanitizedIngredient) {
    $('#results').html('<p class="error">Select an ingredient</p>');
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
      $('#results').html('<p class="error">Error loading data</p>');
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
      $('#results').html('<p class="error">Error loading data</p>');
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
      $('#results').html('<p class="error">Error loading cocktails</p>');
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

      $('#ingredient-select').append(options);
      $('#ingredient-select').select2({
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

      $('#ingredient-select').append(backupOptions);
      $('#ingredient-select').select2({ placeholder: "Pick an ingredient (offline mode)" });
    });
};

App.showFavorites = () => {
  const favorites = App.getFavorites();

  if (favorites.length === 0) {
    $('#results').html('<p class="error">You have no favorite cocktails</p>');
    return;
  }

  App.showSpinner();

  const cardsPromises = favorites.map((cocktailId) => {
    const url = `${App.baseApiUrl}/lookup.php?i=${encodeURIComponent(cocktailId)}`;

    return $.ajax({
      url,
      method: 'GET',
      dataType: 'json'
    }).then((data) => {
      if (data.drinks) {
        const drink = data.drinks[0];
        const safeName = App.escapeHtml(drink.strDrink);
        const safeId = App.escapeHtml(drink.idDrink);
        const safeThumb = App.escapeHtml(drink.strDrinkThumb);

        return `
          <div class="cocktail-card" data-id="${safeId}">
            <img src="${safeThumb}/preview" alt="${safeName}">
            <h3>${safeName}</h3>
            <div class="card-buttons">
              <button class="favorite-btn" data-id="${safeId}">♡</button>
              <button class="detail-link detail-btn" data-id="${safeId}">Recipe detail</button>
            </div>
          </div>
        `;
      }
      return '';
    }).catch(() => '');
  });

  Promise.all(cardsPromises).then((cards) => {
    const html = cards.filter(card => card).join('');
    $('#results').html(`<div class="cocktails-grid">${html}</div>`);
    App.updateFavoriteButtons();
  });
};


App.showCocktailDetail = (cocktailId) => {
  if (!cocktailId) {
    return;
  }

  const modalHtml = `
  <div class="modal fade" id="cocktailModal" tabindex="-1" aria-labelledby="cocktailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="cocktailModalLabel">Loading...</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        
        <div class="modal-body text-center d-flex flex-column align-items-center justify-content-center" style="min-height: 200px;">
          <div class="spinner-border" style="color: #753742; width: 3rem; height: 3rem;" role="status"></div>
          <p class="mt-3" style="color: #753742; font-weight: bold;">Mixing your drink...</p>
        </div>
      </div>
    </div>
  </div>
`;

  $('#cocktailModal').remove();
  $('body').append(modalHtml);

  const modal = new bootstrap.Modal(document.getElementById('cocktailModal'));
  modal.show();

  const url = `${App.baseApiUrl}/lookup.php?i=${encodeURIComponent(cocktailId)}`;

  $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  })
    .done((data) => {
      if (data.drinks && data.drinks.length > 0) {
        App.renderCocktailDetailModal(data.drinks[0]);
      } else {
        $('#cocktailModal .modal-body').html('<p class="error">Cocktail not found</p>');
      }
    })
    .fail(() => {
      $('#cocktailModal .modal-body').html('<p class="error">Error loading cocktail details</p>');
    });
};

App.renderCocktailDetailModal = (drink) => {
  const safeName = App.escapeHtml(drink.strDrink);
  const safeId = App.escapeHtml(drink.idDrink);
  const safeThumb = App.escapeHtml(drink.strDrinkThumb);
  const safeCategory = App.escapeHtml(drink.strCategory || 'N/A');
  const safeAlcoholic = App.escapeHtml(drink.strAlcoholic || 'N/A');
  const safeGlass = App.escapeHtml(drink.strGlass || 'N/A');
  const safeInstructions = App.escapeHtml(drink.strInstructions || 'Instructions are not available.');

  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];

    if (ingredient) {
      const safeIngredient = App.escapeHtml(ingredient);
      const safeMeasure = App.escapeHtml(measure || '');

      ingredients.push(`
      <li class="my-2">
        <span><b>${safeMeasure}</b> ${safeIngredient}</span>
      </li>
    `);
    }
  }



  const ingredientsHtml = `<ul class="ingredients-list">${ingredients.join('')}</ul>`;

  const modalContent = `
    <div class="modal-header">
      <h5 class="modal-title">${safeName}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body">
      <div class="text-center mb-3">
        <img src="${safeThumb}" alt="${safeName}" class="img-fluid rounded" style="max-height: 300px;">
      </div>
      
      <div class="cocktail-info mb-3">
        <p><strong>Category:</strong> ${safeCategory}</p>
        <p><strong>Type:</strong> ${safeAlcoholic}</p>
        <p><strong>Glass:</strong> ${safeGlass}</p>
      </div>

      <h6><strong>Ingredients:</strong></h6>
      ${ingredientsHtml}

      <h6 class="mt-3"><strong>Instructions:</strong></h6>
      <p class="instructions">${safeInstructions}</p>
      
      <div class="text-center mt-3">
        <button class="favorite-btn" data-id="${safeId}">♡</button>
      </div>
    </div>
  `;

  $('#cocktailModal .modal-content').html(modalContent);
  App.updateFavoriteButtons();
};

App.initMainPage = () => {
  console.log('Hlavní stránka načtena');

  const $searchInput = $('#search-input');
  const $searchBtn = $('#search-btn');
  const $ingredientSelect = $('#ingredient-select');
  const $ingredientBtn = $('#ingredient-btn');
  const $randomBtn = $('#random-btn');
  const $favoritesBtn = $('#show-favorites-btn');

  App.loadIngredients();
  App.loadAllCocktails();

  $searchBtn.on('click', () => {
    const searchTerm = $searchInput.val().trim();
    App.searchByName(searchTerm);
  });

  $searchInput.on('keypress', (e) => {
    if (e.which === 13) {
      $searchBtn.click();
    }
  });

  $ingredientBtn.on('click', () => {
    const ingredient = $ingredientSelect.val();
    App.filterByIngredient(ingredient);
  });

  $randomBtn.on('click', () => {
    App.getRandomCocktail();
  });

  $favoritesBtn.on('click', () => {
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
  if ($('#results').length > 0) {
    App.initMainPage();
  }

  $(document).on('click', '.favorite-btn', function (e) {
    e.stopPropagation();
    const cocktailId = $(this).data('id');

    if (App.isFavorite(cocktailId)) {
      App.removeFromFavorites(cocktailId);
      $(this).text('♡');
    } else {
      App.addToFavorites(cocktailId);
      $(this).text('♥');
    }
  });
};

$(document).ready(() => {
  App.init();
});