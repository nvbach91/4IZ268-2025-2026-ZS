const App = {};

App.baseApiUrl = 'https://www.thecocktaildb.com/api/json/v1/1';



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
  $('.favorite-btn').each(function() {
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

  const html = drinks.map((drink) => `
    <div class="cocktail-card" data-id="${drink.idDrink}">
      <img src="${drink.strDrinkThumb}/preview" alt="${drink.strDrink}">
      <h3>${drink.strDrink}</h3>
      <button class="favorite-btn" data-id="${drink.idDrink}">♡</button>
      <a href="../detail/index.html?id=${drink.idDrink}" class="detail-link">Recipe detail</a>
    </div>
  `).join('');

  $('#results').html(`<div class="cocktails-grid">${html}</div>`);
  App.updateFavoriteButtons();
};

App.searchByName = (searchTerm) => {
  if (!searchTerm) {
    $('#results').html('<p class="error">Type the name of the cocktail</p>');
    return;
  }

  $('#results').html('<p>Loading..</p>');

  const url = `${App.baseApiUrl}/search.php?s=${searchTerm}`;

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
  if (!ingredient) {
    $('#results').html('<p class="error">Select an ingredient</p>');
    return;
  }

  $('#results').html('<p>Loading..</p>');
  const url = `${App.baseApiUrl}/filter.php?i=${ingredient}`;

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
  $('#results').html('<p>Loading..</p>');

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
      $('#results').html('<p class="error">Error loading data ❌</p>');
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
      const options = data.drinks.map((item) => 
        `<option value="${item.strIngredient1}">${item.strIngredient1}</option>`
      ).join('');

      $('#ingredient-select').append(options);
      console.log('Ingredience načteny');
    })
    .fail(() => {
      console.log('Chyba při načítání ingrediencí');
    });
};

App.showFavorites = () => {
  const favorites = App.getFavorites();

  if (favorites.length === 0) {
    $('#results').html('<p>You have no favorite cocktails </p>');
    return;
  }

  $('#results').html('<h2>Your favorite cocktails:</h2><div class="cocktails-grid"></div>');

  favorites.forEach((cocktailId) => {
    const url = `${App.baseApiUrl}/lookup.php?i=${cocktailId}`;

    $.ajax({
      url,
      method: 'GET',
      dataType: 'json'
    })
      .done((data) => {
        if (data.drinks) {
          const drink = data.drinks[0];
          const card = `
            <div class="cocktail-card" data-id="${drink.idDrink}">
              <img src="${drink.strDrinkThumb}/preview" alt="${drink.strDrink}">
              <h3>${drink.strDrink}</h3>
              <button class="favorite-btn" data-id="${drink.idDrink}">♡</button>
              <a href="../detail/index.html?id=${drink.idDrink}" class="detail-link">Recipe detail</a>
            </div>
          `;
          $('.cocktails-grid').append(card);
          App.updateFavoriteButtons();
        }
      });
  });
};



App.getCocktailIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

App.renderCocktailDetail = (drink) => {
  const headerHtml = `
    <div class="cocktail-header">
      <h2>${drink.strDrink}</h2>
      <button class="favorite-btn" data-id="${drink.idDrink}">♡</button>
    </div>
    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="cocktail-image">
    <p><strong>Kategorie:</strong> ${drink.strCategory || 'N/A'}</p>
    <p><strong>Typ:</strong> ${drink.strAlcoholic || 'N/A'}</p>
    <p><strong>Sklo:</strong> ${drink.strGlass || 'N/A'}</p>
  `;

  let ingredientsHtml = '<h3>Ingredients:</h3><ul class="ingredients-list">';
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];

    if (ingredient) {
      ingredientsHtml += `<li>${measure ? measure : ''} ${ingredient}</li>`;
    }
  }
  ingredientsHtml += '</ul>';

  const instructionsHtml = `
    <h3>Instructions:</h3>
    <p class="instructions">${drink.strInstructions || 'Instructions are not available.'}</p>
  `;

  $('#cocktail-detail').html(headerHtml);
  $('#cocktail-ingredients').html(ingredientsHtml);
  $('#cocktail-instructions').html(instructionsHtml);

  App.updateFavoriteButtons();
};

App.loadCocktailDetail = (cocktailId) => {
  if (!cocktailId) {
    $('#cocktail-detail').html('<p class="error">ID is missing</p>');
    return;
  }

  $('#cocktail-detail').html('<p>Loading cocktail details...</p>');
  const url = `${App.baseApiUrl}/lookup.php?i=${cocktailId}`;

  $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  })
    .done((data) => {
      if (data.drinks && data.drinks.length > 0) {
        App.renderCocktailDetail(data.drinks[0]);
      } else {
        $('#cocktail-detail').html('<p class="error">Cocktail not found </p>');
      }
    })
    .fail(() => {
      $('#cocktail-detail').html('<p class="error">Error loading cocktail details ❌</p>');
    });
};



App.initMainPage = () => {
  console.log('Hlavní stránka načtena (main/index.html)');

  const $searchInput = $('#search-input');
  const $searchBtn = $('#search-btn');
  const $ingredientSelect = $('#ingredient-select');
  const $ingredientBtn = $('#ingredient-btn');
  const $randomBtn = $('#random-btn');
  const $favoritesBtn = $('#show-favorites-btn');

  App.loadIngredients();

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
};

App.initDetailPage = () => {
  console.log('Detail stránka načten (detail/index.html)');

  const cocktailId = App.getCocktailIdFromUrl();
  App.loadCocktailDetail(cocktailId);
};

App.init = () => {
  if ($('#cocktail-detail').length > 0) {
    App.initDetailPage();
  } else if ($('#results').length > 0) {
    App.initMainPage();
  }

  
  $(document).on('click', '.favorite-btn', function() {
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
